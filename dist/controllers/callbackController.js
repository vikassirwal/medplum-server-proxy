"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCallback = void 0;
const handleCallback = (req, res) => {
    const response = {
        error: 'Not Implemented',
        message: 'Callback endpoint is not yet implemented',
        endpoint: '/callback',
        method: 'GET',
        queryParams: req.query,
        timestamp: new Date().toISOString()
    };
    res.status(501).json(response);
};
exports.handleCallback = handleCallback;
//# sourceMappingURL=callbackController.js.map