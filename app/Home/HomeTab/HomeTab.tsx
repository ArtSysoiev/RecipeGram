
import { Recipe } from "../Models"

const recipes: Recipe[] = [
    {
        id: "1",
        description: null,
        imageUri: null,
        createdAt: null,
        name: "Recipe 1",
        author: {id: "1", login: "2", imageUri: null},
        time: "15s",
        ingredients: [{id: "1", name: "ing1", amount: "1s"}],
        steps: [{id: "2", name: "step2", description: null, imageUri: null}]
    }
]


export default function HomeTab({ recipes }: {recipes: Recipe[]}) {

}

