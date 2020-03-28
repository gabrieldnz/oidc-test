import {Router} from "express";
import Provider from "oidc-provider";

export default (provider: Provider) => {
    const router = Router();

    router.use(provider.callback);

    return router;
};
