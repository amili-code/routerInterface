const { verifyToken } = require('../config/auth');

class Web {
    renderPage(req, res, page, options = {}) {
        const result = verifyToken(req.session.token);
        if (result.login) {
            res.render(page, { name: result.name, email: result.email, ...options });
        } else {
            res.render("login", { text: 'برای دسترسی به امکانات باید ابتدا وارد شوید' });
        }
    }

    // root(req, res) { this.renderPage(req, res, "root"); }
    root(req, res) { res.render('root')}
    // routers(req, res) { res.render('routers')}


    login(req, res) { res.render("login", {}); }
    register(req, res) { res.render("register", {}); }
}

module.exports = new Web();
