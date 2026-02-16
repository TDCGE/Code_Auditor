import {AIClientFactory} from "./AIClientFactory";
import {IAIClient} from "../IAIClient";
import {ClaudeAIClient} from "../ClaudeAIClient";

export class ClaudeClient extends AIClientFactory{
    public createAIClient(): IAIClient {
        return new ClaudeAIClient();
    }
}