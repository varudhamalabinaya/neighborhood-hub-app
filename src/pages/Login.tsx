
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

const Login = () => {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
