import { Request, Response, NextFunction } from "express";
import Joi from "joi";

// Validation schemas
export const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).trim().required().messages({
      "string.min": "Nome deve ter pelo menos 2 caracteres",
      "string.max": "Nome deve ter no máximo 50 caracteres",
      "any.required": "Nome é obrigatório",
    }),
    email: Joi.string().email().lowercase().trim().required().messages({
      "string.email": "Email deve ser válido",
      "any.required": "Email é obrigatório",
    }),
    password: Joi.string()
      .min(8)
      .max(100)
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .messages({
        "string.min": "Senha deve ter pelo menos 8 caracteres",
        "string.pattern.base":
          "Senha deve conter pelo menos uma letra minúscula, maiúscula, número e caractere especial",
        "any.required": "Senha é obrigatória",
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        "string.pattern.base": "Formato de telefone inválido",
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email deve ser válido",
      "any.required": "Email é obrigatório",
    }),
    password: Joi.string().required().messages({
      "any.required": "Senha é obrigatória",
    }),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).trim().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional(),
    location: Joi.string().max(100).trim().optional(),
    company: Joi.string().max(100).trim().optional(),
    website: Joi.string().uri().optional(),
    bio: Joi.string().max(500).trim().optional(),
  }),

  spendCoins: Joi.object({
    amount: Joi.number().integer().min(1).required().messages({
      "number.min": "Valor deve ser maior que 0",
      "any.required": "Quantidade é obrigatória",
    }),
  }),

  earnCoins: Joi.object({
    amount: Joi.number().integer().min(1).required().messages({
      "number.min": "Valor deve ser maior que 0",
      "any.required": "Quantidade é obrigatória",
    }),
  }),
};

export const aiReportSchemas = {
  generateReport: Joi.object({
    userInput: Joi.string().min(10).max(1000).trim().required().messages({
      "string.min": "Descrição deve ter pelo menos 10 caracteres",
      "string.max": "Descrição deve ter no máximo 1000 caracteres",
      "any.required": "Descrição do negócio é obrigatória",
    }),
  }),

  saveReport: Joi.object({
    userId: Joi.string().required(),
    searchQuery: Joi.string().min(3).max(200).required(),
    report: Joi.object().required(),
  }),
};

export const coinSchemas = {
  purchase: Joi.object({
    amount: Joi.number().integer().min(50).max(1000).required().messages({
      "number.min": "Valor mínimo de compra é 50 moedas",
      "number.max": "Valor máximo de compra é 1000 moedas",
      "any.required": "Quantidade é obrigatória",
    }),
  }),

  spend: Joi.object({
    amount: Joi.number().integer().min(1).required().messages({
      "number.min": "Valor deve ser maior que 0",
      "any.required": "Quantidade é obrigatória",
    }),
  }),
};

export const searchSchemas = {
  search: Joi.object({
    query: Joi.string().min(2).max(200).trim().required().messages({
      "string.min": "Termo de busca deve ter pelo menos 2 caracteres",
      "string.max": "Termo de busca deve ter no máximo 200 caracteres",
      "any.required": "Termo de busca é obrigatório",
    }),
  }),
};

// Middleware function
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Dados de entrada inválidos",
        errors,
      });
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
};

// File upload validation
export const validateFileUpload = (allowedTypes: string[], maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo foi enviado",
      });
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(
          ", "
        )}`,
      });
    }

    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `Arquivo muito grande. Tamanho máximo: ${
          maxSize / (1024 * 1024)
        }MB`,
      });
    }

    next();
  };
};
