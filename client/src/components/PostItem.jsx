function PostItem({ post, loading }) {
  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {post.category && <p>Category: {post.category.name}</p>}
    </article>
  );
}

export default PostItem;