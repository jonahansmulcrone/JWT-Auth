import { MiddlewareFn } from "type-graphql"
import { MyContext } from "./MyContext"

// Bearer 810934kjalsdjf

export const isAuthMiddleware: MiddlewareFn<MyContext> = ({context}, next) => {
    const authorization = context.req.headers['authorization'];

    try {
        const token = authorization?.split(' ')[1]
    } catch {

    }

    return next();
}