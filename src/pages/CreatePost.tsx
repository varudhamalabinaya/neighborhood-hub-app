
import Layout from "@/components/layout/Layout";
import PostForm from "@/components/posts/PostForm";

const CreatePost = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <PostForm />
      </div>
    </Layout>
  );
};

export default CreatePost;
