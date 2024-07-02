import { body, check } from 'express-validator'

const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/

export const userAddField = [
  check('phone').notEmpty().withMessage('phone_required').bail().trim(),
  check('password')
    .notEmpty()
    .withMessage('password_required')
    .bail()
    .trim()
    .matches(pwdRegex)
    .withMessage('must')
    .bail()
    .isLength({ min: 8 })
    .withMessage('minimum_8_letters')
    .bail()
    .isLength({ max: 16 })
    .withMessage('maximum_16_letters'),
]

export const userLoginField = [
  check('phone').notEmpty().withMessage('phone_required').bail().trim(),
  check('password')
    .notEmpty()
    .withMessage('password_required')
    .bail()
    .trim()
    .matches(pwdRegex)
    .withMessage('must')
    .bail()
    .isLength({ min: 8 })
    .withMessage('minimum_8_letters')
    .bail()
    .isLength({ max: 16 })
    .withMessage('maximum_16_letters'),
]

export const userUpdateField = [
  check('phone').notEmpty().withMessage('phone_required').bail().trim(),
  check('currentPassword')
    .if(check('newPassword').exists())
    .notEmpty()
    .withMessage('current_password_required')
    .bail()
    .if(check('confirmNewPassword').exists())
    .notEmpty()
    .withMessage('current_password_required')
    .bail()
    .trim()
    .matches(pwdRegex)
    .withMessage('must')
    .bail()
    .isLength({ min: 8 })
    .withMessage('minimum_8_letters')
    .bail()
    .isLength({ max: 16 })
    .withMessage('maximum_16_letters'),
  check('newPassword')
    .if(check('currentPassword').exists())
    .notEmpty()
    .withMessage('new_password_required')
    .bail()
    .if(check('confirmNewPassword').exists())
    .notEmpty()
    .withMessage('new_password_required')
    .bail()
    .trim()
    .matches(pwdRegex)
    .withMessage('must')
    .bail()
    .isLength({ min: 8 })
    .withMessage('minimum_8_letters')
    .bail()
    .isLength({ max: 16 })
    .withMessage('maximum_16_letters'),
]

export const perfumeAddField = [
  check('type').notEmpty().withMessage('type_required'),
  check('name').notEmpty().withMessage('name_required'),
  check('color').notEmpty().withMessage('color_required'),
  check('smell').notEmpty().withMessage('smell_required'),
  check('season').notEmpty().withMessage('season_required'),
  check('gender').notEmpty().withMessage('gender_required'),
  check('purchase_price')
    .notEmpty()
    .withMessage('purchase_price_required')
    .bail()
    .isNumeric()
    .withMessage('must_be_number'),
  check('sale_price')
    .notEmpty()
    .withMessage('sale_price_required')
    .bail()
    .isNumeric()
    .withMessage('must_be_number'),
]

export const orderAddField = [
  check('name').trim().notEmpty().withMessage('name_required'),
  check('phone').trim().notEmpty().withMessage('phone_required'),
  check('perfume.*.qty')
    .trim()
    .notEmpty()
    .withMessage('qty_required')
    .bail()
    .isNumeric()
    .withMessage('qty_must_be_number'),
  check('perfume.*.id').trim().notEmpty().withMessage('not_empty'),
]
