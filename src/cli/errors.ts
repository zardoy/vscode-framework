// TODO style ERROR (white gh red c) camel next white
export class GracefulError extends Error {
    constructor(
        public override message: string,
    ) {
        super(message);
        this.name = 'GracefulError';
    }
}
