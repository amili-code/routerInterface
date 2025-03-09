const { verifyToken } = require('../config/auth');

class Web {
    renderPage(req, res, page, options = {}) {
        // const authHeader = req.headers['authorization'];
        // console.log(authHeader);


        // if (!authHeader) {
        //     return res.render("403", { host: `${process.env.HOST}:${process.env.PORT}/users` });
        // }

        const token = req.session.token;
        

        if (!token) {
            return res.render("403", { host: `${process.env.HOST}:${process.env.PORT}/users` });
        }

        const result = verifyToken(token);
        if (result.login) {
            res.render(page, { name: result.name, token, ...options, routerIp : process.env.ROUTER_INTERFACE });
        } else {
            res.render("403", { host: `${process.env.HOST}:${process.env.PORT}/users` });
        }
    }

    root(req, res) { this.renderPage(req, res, "root"); }
    mikrotik(req, res) { this.renderPage(req, res, "mikrotik/mikrotik"); }
    about(req, res) { this.renderPage(req, res, "about/about"); }
    users(req, res) { res.render('users/root', { paziresh: process.env.PAZIRESH_NUMBER }) }
    login(req, res) { res.render("login/login", {}); }
    // about(req, res) { res.render("about/about", {}); }
    toturial(req, res) { res.render("about/toturial", {}); }
}


module.exports = new Web();
