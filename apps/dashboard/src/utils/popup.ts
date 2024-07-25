export function createPopupWindow(width: number, height: number) {
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;

    return `width=${width},height=${height},left=${left},top=${top},""`;
}

export const popup = {
    open: (url: string) => {
        const width = 1024;
        const height = 640;
        const left = screen.width / 2 - width / 2;
        const top = screen.height / 2 - height / 2;

        window.open(
            url,
            '_blank',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`,
        );
    },
};
