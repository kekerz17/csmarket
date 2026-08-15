import { z } from 'zod';

export const steamTradeUrlSchema = z
  .string()
  .url()
  .refine((u) => u.includes('steamcommunity.com/tradeoffer/new'), {
    message: 'Не похоже на корректную Steam trade URL',
  });
