import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import { Category } from 'src/database/postgresql/entity/category.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { useTypeORM } from 'src/database/postgresql/typeorm'
import createJsonResponse from 'src/util/createJsonResponse'

export const getUserCategories = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Category)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: Number(req.params.userId) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const categories = await dataSource.findBy({ user })

    return createJsonResponse(res, { data: categories, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting categories ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const addUserCategory = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Category)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: Number(req.body.userId) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }
    const categories = await dataSource
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values({ ...req.body, user })
      .returning('*')
      .execute()

    return createJsonResponse(res, { data: categories.generatedMaps[0], msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error adding categories ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const editUserCategory = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Category)
    const categoryId = Number(req.params.id)

    const category = await dataSource.findOneBy({ id: categoryId })
    if (!category) {
      return createJsonResponse(res, { msg: 'Category not found', status: StatusCodes.NOT_FOUND })
    }

    const updatedCategory = await dataSource.createQueryBuilder().update(Category).set(req.body).where({ id: categoryId }).returning('*').execute()
    if (updatedCategory.affected === 1) return createJsonResponse(res, { data: updatedCategory.generatedMaps[0], msg: 'Category updated', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error updating category ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const deleteUserCategory = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Category)
    const categoryId = Number(req.params.id)

    const category = await dataSource.findOneBy({ id: categoryId })
    if (!category) {
      return createJsonResponse(res, { msg: 'Category not found', status: StatusCodes.NOT_FOUND })
    }

    await dataSource.createQueryBuilder().delete().from(Category).where({ id: categoryId }).execute()

    return createJsonResponse(res, { msg: 'Category deleted', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error deleting category ' + error, status: StatusCodes.BAD_REQUEST })
  }
}
