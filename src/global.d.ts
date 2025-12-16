declare interface ErrorConstructor {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    captureStackTrace : (self: unknown, constructor?: Function) => void;
}

