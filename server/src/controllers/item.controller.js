import { asyncHandler } from '../utils/asyncHandler.js';
import * as itemService from '../services/item.service.js';

export const getData = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const result = await itemService.getUserData(userId);
  res.json(result);
});

export const addItem = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { type, name, amount, category } = req.body || {};
  const result = await itemService.createItem(userId, { type, name, amount, category });
  res.status(201).json(result);
});

export const updateItem = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  const { type, name, amount, category } = req.body || {};
  const result = await itemService.updateItem(userId, id, { type, name, amount, category });
  res.json(result);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  const result = await itemService.deleteItem(userId, id);
  res.json(result);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { type, categoryName } = req.params;
  const result = await itemService.deleteCategory(userId, type, categoryName);
  res.json(result);
});
