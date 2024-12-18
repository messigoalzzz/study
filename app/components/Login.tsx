import { signIn, signOut, useSession } from 'next-auth/react';
const ConnectTwitter = () => {
    const { data: session } = useSession();
    const xClick  = () => {
      if(session?.user?.screen_name){
        // 退出
        signOut({ redirect: false });
        window.open('https://twitter.com/logout') // 根据需要执行
      }else{
        // 登陆
        signIn('twitter');
      }
    }
    return (
        <div onClick={xClick} className='bg-black w-5 h-6'>
           {session?.user?.name}
        </div>
    );
};
export default ConnectTwitter;