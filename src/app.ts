import Sugar from "./sugar";
import configs from "./configs";

const executeApp = async() => {
    const sugar = new Sugar(configs.sugar_configs)
    await sugar.initialize()
}
executeApp()

export default executeApp