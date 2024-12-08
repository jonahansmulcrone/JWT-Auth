import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "./entity/User";
import { hash, compare } from 'bcryptjs'
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuthMiddleware } from "./isAuthMiddleware";

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hi!'
    }

    @Query(() => String)
    @UseMiddleware(isAuthMiddleware)
    bye() {
        return 'hi!'
    }

    @Query(() => [User])
    users() {
        return User.find();
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('Could not find user')
        }

        const valid = await compare(password, user.password)

        if (!valid) {
            throw new Error('Bad password')
        }

        // Login Successful

        res.cookie('jid', createRefreshToken(user), { httpOnly: true });

        return {
            accessToken: createAccessToken(user)
        };
    };

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {

        const hashedPassword = await hash(password, 12)

        try {
            await User.insert({
                email,
                password: hashedPassword
            });
        } catch (err) {
            console.log(err);
            return false
        }

        return true
    }
}