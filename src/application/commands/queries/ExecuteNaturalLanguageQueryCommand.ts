export class ExecuteNaturalLanguageQueryCommand {
    constructor(
        public readonly collectionId: string,
        public readonly modelId: string,
        public readonly query: string
    ) { }
}
