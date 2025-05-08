
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/40 py-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">LocalLens</h4>
            <p className="text-sm text-muted-foreground">
              Connect with your local community. Share updates, find services, and stay in the loop with neighborhood happenings.
            </p>
          </div>
          
          <div className="md:mx-auto">
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div className="md:ml-auto">
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Use</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LocalLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
