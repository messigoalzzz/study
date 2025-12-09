import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import { NextAuthOptions } from "next-auth"
import { NextRequest } from 'next/server';
// const handler = NextAuth();
console.log(1);
console.log(2);



// export { handler as GET, handler as POST };



const authOptions:NextAuthOptions = {
    session: { strategy: 'jwt' },
    providers: [
        TwitterProvider({
            clientId: 'UXdxUjIwaXpUNU1aTkFiaENLbWE6MTpjaQ',
            clientSecret: 'yDryAqPfmn1_whKQGIJYvAg78rJd9fw5iICcmpWee7Qw2XT5M2',
            client: {
                httpOptions: {
                    timeout: 20000, // 若终端里有超时报错，则延长超时时间
                },
            },
            version: '2.0', // 重要
            authorization: {
                params: {
                    scope: 'tweet.read users.read follows.read offline.access', // 访问权限
                },
            },
            profile(profile) { // 这一步是为了拿到twitter更详细的用户信息，否则下面的session只能取到name，而取不到username
                console.log('----profile',profile);
                
                return {
                    id: profile.data.id,
                    name: profile.data.name,
                    screen_name: profile.data.username,
                    image: profile.data.profile_image_url,
                    accessToken:profile.data.accessToken
                };
            },
        }),
    ],
    cookies: {
      sessionToken: {
        name: `next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production'
        }
      },
    },
    secret: process.env.AUTH_SECRET, // 重要：根据环境区分，需要和twitter后台中的callback url保持一致
    debug: process.env.NODE_ENV !== 'production',
    callbacks: {
        async jwt({ token, account, user }) {
            if (account) {
                token.accessToken = account.access_token;
                token.sub = account.providerAccountId;
            }
            if (user) {
                token.user = { ...user };
            }
            return token;
        },
        async session({ session, token }) {
            // if (token?.sub) {
            //     session.user.id = token.sub;
            // }
            console.log('---session',session);
            console.log('---token',token);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const aaa = token as any;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            const data:any = {}   

            if (aaa.accessToken) {
                data.accessToken = aaa.accessToken;
              }
            
            session.user = { ...aaa.user };

            data.user = session.user;
            console.log('---',data);

       
            return data;
        },
        async redirect({ url }) {
            console.log('---变量',process.env.NEXTAUTH_URL);
            
            return url
        }
    },
}

const baseHandler = NextAuth(authOptions)


/**
 * 3. 在 GET/POST 里，先动态设置 process.env.NEXTAUTH_URL
 *    再把 request、context 原样传给 baseHandler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
    const host = request.headers.get("host") // "moonpump.ai" or "localhost:3000"
    if (host) {
      const protocol = host.includes("localhost") ? "http" : "https"
      console.log('--host',host);
      process.env.NEXTAUTH_URL = `${protocol}://${host}`
    }
  
    return baseHandler(request, context)
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export async function POST(request: NextRequest, context: any) {
    const host = request.headers.get("host")
    if (host) {
      const protocol = host.includes("localhost") ? "http" : "https"
      console.log('--host',host);
      
      process.env.NEXTAUTH_URL = `${protocol}://${host}`
    }
  
    return baseHandler(request, context)
  }