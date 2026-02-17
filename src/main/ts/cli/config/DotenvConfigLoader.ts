import { IConfigLoader } from "./IConfigLoader";
import dotenv from "dotenv";

export class DotenvConfigLoader implements IConfigLoader {
    load(): void {
        dotenv.config();
    }
}