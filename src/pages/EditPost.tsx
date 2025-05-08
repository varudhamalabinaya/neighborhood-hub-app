
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import EditPostForm from "@/components/posts/EditPostForm";

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p>The post you are looking for does not exist.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <EditPostForm postId={id} />
      </div>
    </Layout>
  );
};

export default EditPost;
