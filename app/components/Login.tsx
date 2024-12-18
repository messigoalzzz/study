import { signIn, signOut, useSession } from 'next-auth/react';
const ConnectTwitter = () => {
    const { data: session } = useSession();
    const xClick  = () => {
        signIn('twitter');
    }
    return (
        <div onClick={xClick} className='bg-black w-5 h-6'>
           {session?.user?.name}
        </div>
    );
};
export default ConnectTwitter;