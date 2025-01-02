"use client";


const TokenDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Token Details</h1>
      <p>Token ID: {id}</p>
      <p>This is the detail page for token with ID: {id}.</p>
    </div>
  );
};

export default TokenDetailPage;