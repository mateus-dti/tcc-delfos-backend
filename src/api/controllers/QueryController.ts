import { Request, Response } from 'express';
import { ExecuteNaturalLanguageQueryCommand } from '../../application/commands/queries/ExecuteNaturalLanguageQueryCommand';
import { ExecuteNaturalLanguageQueryCommandHandler } from '../../application/commands/queries/ExecuteNaturalLanguageQueryCommandHandler';

export class QueryController {
    async execute(req: Request, res: Response): Promise<Response> {
        const { collectionId, modelId, query } = req.body;

        if (!collectionId || !modelId || !query) {
            return res.status(400).json({ error: 'collectionId, modelId e query são obrigatórios' });
        }

        const command = new ExecuteNaturalLanguageQueryCommand(collectionId, modelId, query);
        const handler = new ExecuteNaturalLanguageQueryCommandHandler();

        try {
            const results = await handler.handle(command);
            return res.status(200).json(results);
        } catch (error: any) {
            console.error('Erro ao executar query:', error);
            return res.status(500).json({ error: error.message || 'Erro interno ao processar a query' });
        }
    }
}
