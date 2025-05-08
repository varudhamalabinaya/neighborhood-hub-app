
import Layout from "@/components/layout/Layout";
import RegisterForm from "@/components/auth/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";

const Register = () => {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <RegisterForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
