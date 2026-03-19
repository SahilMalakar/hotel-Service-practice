import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

import { getCorrelationId } from "../utils/helpers/request.helpers";
import logger from "../config/logger.config";
import {
  BadRequestError,
  InternalServerError,
} from "../utils/errors/app.error";

const formatZodError = (error: ZodError) => {
  return error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
};

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const correlationId = getCorrelationId();

    try {
      const parsed = schema.parse(req.body);

      logger.info({
        message: "Body validation successful",
        correlationId,
        data: parsed,
      });

      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = formatZodError(error);

        logger.error({
          message: "Body validation failed",
          correlationId,
          data: formatted,
        });

        return next(new BadRequestError("Invalid request body"));
      }

      logger.error({
        message: "Unexpected error during body validation",
        correlationId,
        data: error,
      });

      return next(new InternalServerError("Validation middleware failed"));
    }
  };

export const validateParams =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const correlationId = getCorrelationId();

    try {
      const parsed = schema.parse(req.params);

      logger.info({
        message: "Params validation successful",
        correlationId,
        data: parsed,
      });

      req.params = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = formatZodError(error);

        logger.error({
          message: "Params validation failed",
          correlationId,
          data: formatted,
        });

        return next(new BadRequestError("Invalid request params"));
      }

      logger.error({
        message: "Unexpected error during params validation",
        correlationId,
        data: error,
      });

      return next(new InternalServerError("Validation middleware failed"));
    }
  };

export const validateQuery =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const correlationId = getCorrelationId();

    try {
      const parsed = schema.parse(req.query);

      logger.info({
        message: "Query validation successful",
        correlationId,
        data: parsed,
      });

      req.query = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = formatZodError(error);

        logger.error({
          message: "Query validation failed",
          correlationId,
          data: formatted,
        });

        return next(new BadRequestError("Invalid query params"));
      }

      logger.error({
        message: "Unexpected error during query validation",
        correlationId,
        data: error,
      });

      return next(new InternalServerError("Validation middleware failed"));
    }
  };
