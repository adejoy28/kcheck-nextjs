export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer" role="contentinfo">
            <p className="footer__text">
                © {currentYear} Knowledge Check System (CBT)
            </p>
        </footer>
    );
}