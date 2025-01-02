

//meta表示当前页面的元数据，可以用来设置页面的标题，描述，图标等等
export function generateMetadata() {
  return {
    title: "Token Details",
    description: "View token details",
    icon: "/favicon.ico",
    twitter: {
      card: "summary_large_image",
      title: "Token Details",
      description: "View token details",
      images: "https://moonpump.me/image/logo.svg",
    },
  };
}
const TokenDetailPage = () => {

  return (
    <>
      <div style={{ padding: "20px" }}>
      <h1>Token Details</h1>
      <p>Token ID: </p>
      <p>This is the detail page for token with ID:.</p>
    </div>
    </>
  
  );
};

export default TokenDetailPage;