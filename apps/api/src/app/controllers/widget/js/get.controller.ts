import { API_URL, AUTH_URL, DASHBOARD_URL, NODE_ENV, WIDGET_URL } from '@thxnetwork/api/config/secrets';
import BrandService from '@thxnetwork/api/services/BrandService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { QuestInvite } from '@thxnetwork/api/models/QuestInvite';
import { Widget } from '@thxnetwork/api/models/Widget';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { query, param } from 'express-validator';
import { minify } from 'terser';

const validation = [
    param('id').isMongoId(),
    query('identity').optional().isUUID(),
    query('containerSelector').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widget']
    const referralRewards = await QuestInvite.find({
        poolId: req.params.id,
    });
    const refs = JSON.stringify(
        referralRewards
            .filter((r) => r.successUrl)
            .map((r) => {
                return {
                    uuid: r.uuid,
                    successUrl: r.successUrl,
                };
            }),
    );

    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Pool not found.');

    const expired = pool.settings.endDate ? pool.settings.endDate.getTime() <= Date.now() : false;
    const brand = await BrandService.get(pool._id);
    const widget = await Widget.findOne({ poolId: req.params.id });
    const referrerHeader = req.header('Referrer');
    const widgetOrigin = widget.domain ? new URL(widget.domain).origin : '';
    const origin = referrerHeader ? new URL(referrerHeader).origin : '';

    // Set active to true if there is a request made from the configured domain
    if (widgetOrigin === origin && !widget.active) {
        await widget.updateOne({ active: true });
    }

    const data = `
if (typeof window.THXWidget !== 'undefined') {
    window.THXWidget.onLoad();
} else {
    class THXWidget {
        MD_BREAKPOINT = 990;
        public isAuthenticated = false;
    
        constructor(settings) {
            this.settings = settings;
            this.theme = JSON.parse(settings.theme);
            this.init();
        }

        get defaultStyles() {
            const isCustomContainer = !!this.settings.containerSelector;
            return {
                sm: {
                    width: '100%',
                    height: '100%',
                    maxHeight: 'none',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: 0,
                    borderRadius: 0,
                },
                md: {
                    top: 'auto',
                    bottom: isCustomContainer ? 'auto' : '100px',
                    maxHeight: isCustomContainer ? 'none' : '703px',
                    width: isCustomContainer ? '100%' : '400px',
                    border: 0,
                    borderRadius: isCustomContainer ? '0px' : '10px',
                    height: isCustomContainer ? '100%' : 'calc(100% - 115px)',
                },
            }
        }

        init() {
            const waitForBody = () => new Promise((resolve) => {
                const tick = () => {
                    if (document.getElementsByTagName('body').length) {
                        clearInterval(timer)
                        resolve()
                    }
                }
                const timer = setInterval(tick, 1000);
            });
            waitForBody().then(this.onLoad.bind(this));
        }

        public setIdentity(identity) {
            this.iframe.contentWindow.postMessage({ message: 'thx.auth.identity', identity }, this.settings.widgetUrl);
        }

        public signin() {
            this.iframe.contentWindow.postMessage({ message: 'thx.auth.signin' },  this.settings.widgetUrl);
        }

        public signout() {
            this.iframe.contentWindow.postMessage({ message: 'thx.auth.signout' },  this.settings.widgetUrl);
        }

        public open(widgetPath) {
            if (!widgetPath) return;

            const { widgetUrl, poolId, chainId, theme } = this.settings;
            const path = '/c/' + poolId + widgetPath;
            const isMobile = window.matchMedia('(pointer:coarse)').matches;

            if (isMobile) {
                // Window _blank will be blocked by mobile OS so we redirect the current window
                window.location.href = this.settings.widgetUrl + path   
            } else {
                this.iframe.contentWindow.postMessage({ message: 'thx.iframe.navigate', path }, widgetUrl);
                this.show(true);
            }
        }
    
        public connect(uuid) {
            this.open('/w/' + uuid);
        }

        public quests = {
            list: () => {
                this.iframe.contentWindow.postMessage({ message: 'thx.quests.list' }, this.settings.widgetUrl);
            }
        }

        onLoad() {
            this.referrals = JSON.parse(this.settings.refs).filter((r) => r.successUrl);
            this.iframe = this.createIframe();

            if (this.settings.isPublished) {
                this.notifications = this.createNotifications(0);
                this.message = this.createMessage();
                this.launcher = this.settings.cssSelector ? this.selectLauncher() : this.createLauncher();
                this.container = this.createContainer(this.iframe, this.launcher, this.message);
            }

            this.parseURL();
            
            window.matchMedia('(max-width: 990px)').addListener(this.onMatchMedia.bind(this));
            window.onmessage = this.onMessage.bind(this);
        }

        parseURL() {
            const url = new URL(window.location.href)
            this.ref = url.searchParams.get('ref');
            if (!this.ref) return;

            this.successUrls = this.referrals.map((r) => r.successUrl);
            if (!this.successUrls.length) return;
        }
    
        get isSmallMedia() {
            const getWidth = () => window.innerWidth;
            return getWidth() < this.MD_BREAKPOINT;
        }

        createURL() {
            const parentUrl = new URL(window.location.href)
            const path = parentUrl.searchParams.get('thx_widget_path');
            const { widgetUrl, poolId, chainId, theme, expired, logoUrl, backgroundUrl, title } = this.settings;
            const url = new URL(widgetUrl);

            url.pathname = this.widgetPath = '/c/' + poolId + (path || '/quests');
            url.searchParams.append('origin', window.location.origin);
            
            return url;
        }

        createIframe() {
            const { widgetUrl, poolId, chainId, theme, align, expired, containerSelector } = this.settings;
            const iframe = document.createElement('iframe');
            const styles = this.isSmallMedia ? this.defaultStyles['sm'] : this.defaultStyles['md'];
            const url = this.createURL();

            iframe.id = 'thx-iframe';
            iframe.src = url;
            iframe.setAttribute('data-hj-allow-iframe', true);

            if (containerSelector) {
                Object.assign(iframe.style, this.defaultStyles[this.isSmallMedia ? 'sm' : 'md']);
                return iframe;
            }

            let top, bottom, left, right, marginLeft, marginTop, transformOrigin;
        
            if (!this.isSmallMedia) {
                switch(align) {
                    case 'left' :
                        top = 'auto';
                        bottom = !this.settings.cssSelector ? '100px' : '15px';
                        left = '15px';
                        right = 'auto';
                        transformOrigin = 'bottom left';
                        break;
                    case 'right' :
                        top = 'auto';
                        bottom = !this.settings.cssSelector ? '100px' : '15px';
                        left = 'auto';
                        right = '15px';
                        transformOrigin = 'bottom right';
                        break;
                    case 'center' :
                        top = '50%';
                        left = '50%';
                        right = 'auto';
                        bottom = 'auto';
                        marginLeft = '-200px';
                        marginTop = '-340px';
                        transformOrigin = 'center center';
                        break;
                }
            } else {
                top = '0';
                bottom = '0';
                left = '0';
                right = '0';
            }

            Object.assign(iframe.style, {
                ...styles,
                zIndex: 99999999,
                display: 'flex',
                top,
                bottom, 
                left, 
                right,
                marginLeft, 
                marginTop,
                position: 'fixed',
                border: '0',
                opacity: '0',
                boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px',
                transform: 'scale(0)',
                transformOrigin,
                transition: '.2s opacity ease, .1s transform ease',
            });
    
            return iframe;
        }
    
        createNotifications(counter) {
            const notifications = document.createElement('div');
            notifications.id = 'thx-notifications';
            Object.assign(notifications.style, {
                display: 'none',
                fontFamily: 'Arial',
                fontSize: '13px',
                justifyContent: 'center',
                alignItems: 'center',
                width: '20px',
                height: '20px',
                color: '#FFFFFF',
                position: 'absolute',
                backgroundColor: '#CA0000',
                borderRadius: '50%',
                userSelect: 'none',
            });
            notifications.innerHTML = counter;
            return notifications;
        }

        createMessage() {
            const { message, logoUrl, align } = this.settings;
            const messageBox = document.createElement('div');
            const closeBox = document.createElement('button');

            messageBox.id = 'thx-message';
            
            closeBox.innerHTML = '&times;';             
            
            Object.assign(closeBox.style, {
                display: 'flex',
                fontFamily: 'Arial',
                fontSize: '16px',
                justifyContent: 'center',
                alignItems: 'center',
                width: '20px',
                height: '20px',
                border: '0',
                color: '#000000',
                position: 'absolute',
                backgroundColor: 'transparent',
                top: '0',
                right: '0',
                opacity: '0.5',
                transform: 'scale(.9)',
                transition: '.2s opacity ease, .1s transform ease',
            });
            closeBox.addEventListener('mouseenter', () => {
                closeBox.style.opacity = '1';
                closeBox.style.transform = 'scale(1)';
            });
            closeBox.addEventListener('mouseleave', () => {
                closeBox.style.opacity = '.5';
                closeBox.style.transform = 'scale(.9)';
            });
            closeBox.addEventListener('click', () => {
                this.message.remove();
            });
            
            Object.assign(messageBox.style, {
                zIndex: 9999999,
                display: message ? 'flex' : 'none',
                lineHeight: 1.5,
                fontFamily: 'inherit, sans-serif',
                fontSize: '12px',
                fontWeight: 'normal',
                justifyContent: 'center',
                alignItems: 'center',
                width: '200px',
                color: '#000000',
                position: 'fixed',
                backgroundColor: '#FFFFFF',
                borderRadius: '5px',
                userSelect: 'none',
                padding: '10px 10px 10px',
                bottom: '90px',
                right: align === 'right' ? '15px' : 'auto',
                left: align === 'left' ? '15px' : 'auto',
                boxShadow: 'rgb(50 50 93 / 25%) 0px 50px 100px -20px, rgb(0 0 0 / 30%) 0px 30px 60px -30px',
                opacity: 0,
                transform: 'scale(0)',
                transition: '.2s opacity ease, .1s transform ease',
            });

            const wrapper = document.createElement('span');
            wrapper.style.zIndex = 0;
            wrapper.innerHTML = message;
            messageBox.appendChild(wrapper);
            messageBox.appendChild(closeBox);
                
            return messageBox;
        }
    
        selectLauncher() {
            const launcher = document.querySelector(this.settings.cssSelector);           
            if (!launcher) {
                console.error("THX widget can't find the launcher for selector: " + this.settings.cssSelector);
                return;
            }

            launcher.addEventListener('click', this.onClickLauncher.bind(this));

            setTimeout(() => {
                const url = new URL(window.location.href)
                const widgetPath = url.searchParams.get('thx_widget_path');  
                
                this.show(!!widgetPath);
            }, 350);
            
            return launcher;
        }

        createLauncher() {
            const svgGift = this.settings.iconImg 
                ? '<img id="thx-svg-icon" style="display:block; margin: auto;" width="40" height="40" src="' + this.settings.iconImg + '" alt="Widget launcher icon" />'
                : '<svg id="thx-svg-icon" style="display:block; margin: auto; fill: '+this.theme.elements.launcherIcon.color+'; width: 20px; height: 20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"/></svg>';
            const launcher = document.createElement('div');
            launcher.id = 'thx-launcher';

            Object.assign(launcher.style, {
                zIndex: 9999999,
                display: 'flex',
                width: '60px',
                height: '60px',
                backgroundColor: this.theme.elements.launcherBg.color,
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'fixed',
                bottom: '15px',
                right: !this.settings.cssSelector ? this.settings.align === 'right' ? '15px' : 'auto' : 'auto',
                left: !this.settings.cssSelector ? this.settings.align === 'left' ? '15px' : 'auto' : 'auto',
                opacity: 0,
                transition: '.2s opacity ease, .1s transform ease',
            });

            launcher.innerHTML = svgGift;
            launcher.addEventListener('click', this.onClickLauncher.bind(this));
            launcher.appendChild(this.notifications);
            
            setTimeout(() => {
                launcher.style.opacity = 1;
                launcher.style.transform = 'scale(1)';

                this.message.style.opacity = 1;
                this.message.style.transform = 'scale(1)';

                const url = new URL(window.location.href)
                const widgetPath = url.searchParams.get('thx_widget_path');
                this.show(!!widgetPath)
            }, 350);
    
            return launcher;
        }
    
        createContainer(iframe, launcher, message) {
            const { containerSelector, cssSelector } = this.settings;
            let container;
            if (containerSelector) {
                container = document.querySelector(containerSelector)
                if (!container) throw new Error("Could not find an HTML element for selector: '" + containerSelector + "'.")
                container.appendChild(iframe);   
            } else {
                container = document.createElement('div');
                container.id = 'thx-container';
                container.appendChild(iframe);   
                
                if (!cssSelector) {
                    container.appendChild(launcher);
                    container.appendChild(message);
                }  
                
                document.body.appendChild(container);
            }
            return container;
        }

        storeRef(ref) {
            if (!ref) return;
            
            window.localStorage.setItem('thx:widget:' + this.settings.poolId + ':ref', ref);
            this.iframe.contentWindow.postMessage({ message: 'thx.config.ref', ref }, this.settings.widgetUrl);
            this.timer = window.setInterval(this.onURLDetectionCallback.bind(this), 500);
        }
        
        onMessage(event) {
            if (event.origin !== this.settings.widgetUrl) return;
            const { message, amount, isAuthenticated, url } = event.data;
            switch (message) {
                case 'thx.auth.signin': {
                    this.onSignin(url);
                    break
                }
                case 'thx.widget.ready': {
                    this.onWidgetReady();
                    break
                }
                case 'thx.reward.amount': {
                    this.notifications.innerText = amount;
                    this.notifications.style.display = amount ? 'flex' : 'none';
                    break;
                }
                case 'thx.widget.toggle': {
                    this.show(!Number(this.iframe.style.opacity));
                    break;
                }
                case 'thx.auth.status': {
                    this.isAuthenticated = isAuthenticated;
                    break;
                }
            }
        }

        onSignin(url) {
            window.open(url, '_blank');
        }

        onClickLauncher() {
            const isMobile = window.matchMedia('(pointer:coarse)').matches;
            if (window.ethereum && isMobile) {
                const deeplink = 'https://metamask.app.link/dapp/';
                const ua = navigator.userAgent.toLowerCase();
                const isAndroid = ua.indexOf("android") > -1;
                const url = isAndroid ? deeplink + this.createURL() : this.createURL();   
                window.open(url, '_blank');
            } else if (!window.ethereum && isMobile) { 
                window.open(this.createURL(), '_blank');
            } else {
                this.show(!Number(this.iframe.style.opacity));
            }
            this.message.remove();
        }

        onWidgetReady() {      
            const parentUrl = new URL(window.location.href)
            const widgetPath = parentUrl.searchParams.get('thx_widget_path');

            this.open(widgetPath);
            this.storeRef(this.ref);

            if (this.settings.identity) {
                this.setIdentity(this.settings.identity)
            }
        }

        show(isShown) {
            const { containerSelector } = this.settings;
            const shouldShow = isShown || !!containerSelector;

            this.iframe.style.opacity = shouldShow ? '1' : '0';
            this.iframe.style.transform = shouldShow ? 'scale(1)' : 'scale(0)';
            
            if (this.iframe.contentWindow) {
                this.iframe.contentWindow.postMessage({ message: 'thx.iframe.show', shouldShow }, this.settings.widgetUrl);
            }
        
            if (shouldShow) this.message.remove();
        }

        onURLDetectionCallback() {
            for (const ref of this.referrals) {
                if (!(this.successUrls.filter((url) => url.includes(window.location.origin + window.location.pathname))).length) continue;
                this.iframe.contentWindow.postMessage({ message: 'thx.referral.claim.create', uuid: ref.uuid, }, this.settings.widgetUrl);

                const index = this.referrals.findIndex((r) => ref.uuid);
                this.referrals.splice(index, 1);
            }
            
            if (!this.referrals.length) {
                window.clearInterval(this.timer);
            }
        }
    
        onMatchMedia(x) {
            if (x.matches) {
                const iframe = document.getElementById('thx-iframe');
                Object.assign(iframe.style, this.defaultStyles['sm']);
            } else {
                const iframe = document.getElementById('thx-iframe');
                Object.assign(iframe.style, this.defaultStyles['md']);
            }
        }
    }
    window.THXWidget = new THXWidget({
        apiUrl: '${API_URL}',
        isPublished: window.location.origin.includes("${DASHBOARD_URL}") || ${widget.isPublished},
        widgetUrl: '${WIDGET_URL}',
        poolId: '${req.params.id}',
        chainId: '${pool.chainId}',
        title: '${pool.settings.title}',
        cssSelector: '${widget.cssSelector || ''}',
        logoUrl: '${brand && brand.logoImgUrl ? brand.logoImgUrl : AUTH_URL + '/img/logo-padding.png'}',
        backgroundUrl: '${brand && brand.backgroundImgUrl ? brand.backgroundImgUrl : ''}',
        iconImg: '${widget.iconImg || ''}',
        message: '${widget.message || ''}',
        align: '${widget.align || 'right'}',
        theme: '${widget.theme}',
        refs: ${JSON.stringify(refs)},
        expired: '${expired}',
        identity: '${req.query.identity || ''}',
        containerSelector: '${req.query.containerSelector || ''}'
    });
}
`;
    const result = await minify(data, {
        mangle: { toplevel: false },
        sourceMap: NODE_ENV !== 'production',
    });

    res.set({ 'Content-Type': 'application/javascript' }).send(result.code);
};

export default { controller, validation };
