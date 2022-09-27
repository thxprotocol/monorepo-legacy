export async function poll(fn: () => Promise<any>, fnCondition: (result: string) => boolean, ms: number) {
    let result = await fn();
    while (fnCondition(result)) {
        await wait(ms);
        result = await fn();
    }
    return result;
}

function wait(ms = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
