import {Context, NarrowedContext, Telegraf} from "telegraf";

declare global {
    type Bot = Telegraf<Context<Update>>
    type Ctx = NarrowedContext<Context<Update>, {message: Update.New & Update.NonChannel & Message.TextMessage, update_id: number}>
}
