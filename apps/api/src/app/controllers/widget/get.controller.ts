import { API_URL, NODE_ENV, WIDGET_URL } from '@thxnetwork/api/config/secrets';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { Widget } from '@thxnetwork/api/models/Widget';
import BrandService from '@thxnetwork/api/services/BrandService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { minify } from 'terser';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widget']
    const referralRewards = await ReferralReward.find({
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

    const brand = await BrandService.get(pool._id);
    const widget = await Widget.findOne({ poolId: req.params.id });

    const data = `
    class THXWidget {
        MD_BREAKPOINT = 990;
        defaultStyles = {
            sm: {
                width: '100%',
                height: '100%',
                maxHeight: 'none',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 0,
            },
            md: {
                top: 'auto',
                bottom: '100px',
                maxHeight: '680px',
                width: '400px',
                borderRadius: '10px',
                height: 'calc(100% - 115px)',
            },
        };
    
        constructor(settings) {
            if (!settings) return console.error("THXWidget requires a settings object.");
            this.settings = settings;
            this.iframe = this.createIframe(settings.widgetUrl, settings.poolId, settings.chainId, settings.origin, settings.theme, settings.align);
            this.iframe.setAttribute('data-hj-allow-iframe', true);
            this.notifications = this.createNotifications(0);
            this.message = this.createMessage(settings.message, settings.logo, settings.align);
            this.launcher = this.createLauncher(this.notifications, settings.align);
            this.container = this.createContainer(this.iframe, this.launcher, this.message);
            this.referrals = JSON.parse(this.settings.refs).filter((r) => r.successUrl);

            this.parseURL();

            window.matchMedia('(max-width: 990px)').addListener(this.onMatchMedia.bind(this));
            window.onmessage = this.onMessage.bind(this);
        }

        parseURL() {
            const url = new URL(window.location.href)
            const param = url.searchParams.get('ref');
            if (!param) return;

            this.ref = param;
            
            const { uuid } = JSON.parse(atob(this.ref));
            const referral = this.referrals.find((r) => r.uuid === uuid);
            if (!referral) return;
            
            this.successUrl = referral.successUrl;
        }

        storeReferrer() {    
            this.timer = window.setInterval(this.onMatchSuccessUrl.bind(this), 500);
            if (this.ref) this.iframe.contentWindow.postMessage({ message: 'thx.config.ref', ref: this.ref }, this.settings.widgetUrl);
        }
    
        get isSmallMedia() {
            return window.innerWidth < this.MD_BREAKPOINT;
        }

        createIframe(widgetUrl, poolId, chainId, origin, theme, align) {
            const iframe = document.createElement('iframe');
            const styles = this.isSmallMedia ? this.defaultStyles['sm'] : this.defaultStyles['md'];
            const url = new URL(widgetUrl);

            url.searchParams.append('id', poolId);
            url.searchParams.append('origin', origin);
            url.searchParams.append('chainId', chainId);
            url.searchParams.append('theme', theme);
            
            iframe.id = 'thx-iframe';
            iframe.src = url;
            Object.assign(iframe.style, {
                ...styles,
                zIndex: 99999999,
                display: 'flex',
                right: !this.isSmallMedia && align === 'right' ? '15px' : 'auto',
                left: !this.isSmallMedia && align === 'left' ? '15px' : 'auto',
                position: 'fixed',
                border: '0',
                opacity: '0',
                boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px',
                transform: 'scale(0)',
                transformOrigin: align === 'right' ? 'bottom right' : 'bottom left',
                transition: '.2s opacity ease, .1s transform ease',
            });
    
            return iframe;
        }
    
        createNotifications(counter) {
            const notifications = document.createElement('div');
            notifications.id = 'thx-notifications';
            Object.assign(notifications.style, {
                display: 'flex',
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

        createMessage(message, logoUrl, align) {
            const messageBox = document.createElement('div');
            const logoBox = document.createElement('div');
            const closeBox = document.createElement('button');

            messageBox.id = 'thx-message';
            
            closeBox.innerHTML = '&times;';             
            
            Object.assign(logoBox.style, {
                zIndex: '0',
                display: 'block',
                backgroundColor: '#FFFFFF',
                backgroundImage: 'url(' + logoUrl + ')',
                width: '40px',
                height: '40px',
                top: '-20px',
                position: 'absolute',
                borderRadius: '20px',
                backgroundSize: '30px auto',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            });

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
                display: message ? 'flex' : 'none',
                fontFamily: 'Arial',
                fontSize: '13px',
                justifyContent: 'center',
                alignItems: 'center',
                width: '200px',
                color: '#000000',
                position: 'fixed',
                backgroundColor: '#FFFFFF',
                borderRadius: '5px',
                userSelect: 'none',
                padding: '15px 10px 5px',
                bottom: '90px',
                right: align === 'right' ? '15px' : 'auto',
                left: align === 'left' ? '15px' : 'auto',
                boxShadow: 'rgb(50 50 93 / 25%) 0px 50px 100px -20px, rgb(0 0 0 / 30%) 0px 30px 60px -30px',
                opacity: 0,
                transform: 'scale(0)',
                transition: '.2s opacity ease, .1s transform ease',
            });

            messageBox.innerHTML = '<span style="z-index: 0">' + message + '</span>';
            messageBox.appendChild(closeBox);
            messageBox.prepend(logoBox);

                
            return messageBox;
        }
    
        createLauncher(notifications, align) {
            const svgGift =
                '<svg id="thx-svg-gift" style="display:block; margin: auto; fill: '+this.settings.color+'; width: 20px; height: 20px; transform: scale(1); transition: transform .2s ease;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"/></svg>';
            const launcher = document.createElement('div');
            launcher.id = 'thx-launcher';
            Object.assign(launcher.style, {
                zIndex: 9999999,
                display: 'flex',
                width: '60px',
                height: '60px',
                backgroundColor: this.settings.bgColor,
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'fixed',
                bottom: '15px',
                right: align === 'right' ? '15px' : 'auto',
                left: align === 'left' ? '15px' : 'auto',
                opacity: 0,
                transform: 'scale(0)',
                transition: '.2s opacity ease, .1s transform ease',
            });
            launcher.innerHTML = svgGift;
            launcher.addEventListener('click', () => {
                const iframe = document.getElementById('thx-iframe');
                iframe.style.opacity = iframe.style.opacity === '0' ? '1' : '0';
                iframe.style.transform = iframe.style.transform === 'scale(0)' ? 'scale(1)' : 'scale(0)';

                this.message.remove();

                this.iframe.contentWindow.postMessage({ message: 'thx.iframe.show', isShown: !!Number(iframe.style.opacity) }, this.settings.widgetUrl);
            });
            launcher.addEventListener('mouseenter', () => {
                const gift = document.getElementById('thx-svg-gift');
                gift.style.transform = 'scale(1.1)';
            });
            launcher.addEventListener('mouseleave', () => {
                const gift = document.getElementById('thx-svg-gift');
                gift.style.transform = 'scale(1)';
            });
            launcher.appendChild(notifications);
    
            setTimeout(() => {
                launcher.style.opacity = 1;
                launcher.style.transform = 'scale(1)';

                this.message.style.opacity = 1;
                this.message.style.transform = 'scale(1)';
            }, 1500);
    
            return launcher;
        }
    
        createContainer(iframe, launcher, message) {
            const container = document.createElement('div');
            container.id = 'thx-container';
            container.appendChild(iframe);
            container.appendChild(launcher);
            container.appendChild(message);
    
            document.body.appendChild(container);
    
            return container;
        }
    
        onMessage(event) {
            if (!this.settings.widgetUrl || event.origin !== this.settings.widgetUrl) return;
            const { message, amount } = event.data;
            switch (message) {
                case 'thx.widget.ready':{
                    this.storeReferrer()      
                    break
                }
                case 'thx.reward.amount': {
                    this.notifications.innerText = amount;
                    break;
                }
                case 'thx.widget.close': {
                    this.iframe.style.opacity = this.iframe.style.opacity === '0' ? '1' : '0';
                    this.iframe.style.transform = this.iframe.style.transform === 'scale(0)' ? 'scale(1)' : 'scale(0)';
                    this.iframe.contentWindow.postMessage({ message: 'thx.iframe.show', isShown: false }, this.settings.widgetUrl);
                    break;
                }
            }
        }
    
        onMatchSuccessUrl() {
            for (const ref of this.referrals) {
                if (window.location.href !== ref.successUrl) continue;

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
        widgetUrl: '${WIDGET_URL}',
        poolId: '${req.params.id}',
        logo: '${brand && brand.logoImgUrl ? brand.logoImgUrl : 'https://auth.thx.network/img/logo.png'}',
        message: '${widget.message}',
        align: '${widget.align || 'right'}',
        chainId: '${pool.chainId}',
        color: '${widget.color}',
        bgColor: '${widget.bgColor}',
        theme: '${widget.theme}',
        origin: '${new URL(req.header('Referrer')).origin}',
        refs: ${JSON.stringify(refs)},
    });
`;
    const result = await minify(data, {
        mangle: { toplevel: false },
        sourceMap: NODE_ENV !== 'production',
    });

    res.set({ 'Content-Type': 'application/javascript' }).send(result.code);
};

export default { controller, validation };
