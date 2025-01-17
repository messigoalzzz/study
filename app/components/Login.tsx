import { signIn, useSession } from 'next-auth/react';
const ConnectTwitter = () => {
    const { data: session } = useSession();
    console.log('---',session);
    
    const xClick  = () => {
        signIn('twitter',{callbackUrl: "/airdrop" });
    }
    return (
        <div onClick={xClick} className='bg-black w-5 h-6'>
           {session?.user?.name}
        </div>
    );
};
export default ConnectTwitter;