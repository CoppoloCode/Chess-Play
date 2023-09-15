import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const GamesModel = z.object({
  id: z.string(),
  playerOneId: z.string(),
  playerOneColor: z.string().nullish(),
  playerTwoId: z.string().nullish(),
  Board: z.string(),
})

export interface CompleteGames extends z.infer<typeof GamesModel> {
  playerOne: CompleteUser
  playerTwo?: CompleteUser | null
}

/**
 * RelatedGamesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGamesModel: z.ZodSchema<CompleteGames> = z.lazy(() => GamesModel.extend({
  playerOne: RelatedUserModel,
  playerTwo: RelatedUserModel.nullish(),
}))
