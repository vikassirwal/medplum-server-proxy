/**
 * Callback Controller
 * Handles callback endpoints for other servers
 */

import { Request, Response } from 'express';
import { CallbackResponseDto } from '../dto/callback.dto';
import { ControllerFunction } from '../types/common.types';

/**
 * Handles callback requests from other servers
 * @param req - Express request object
 * @param res - Express response object
 */
const handleCallback: ControllerFunction = (req: Request, res: Response): void => {
  const response: CallbackResponseDto = {
    error: 'Not Implemented',
    message: 'Callback endpoint is not yet implemented',
    endpoint: '/callback',
    method: 'GET',
    queryParams: req.query,
    timestamp: new Date().toISOString()
  };

  res.status(501).json(response);
};

export {
  handleCallback
};
