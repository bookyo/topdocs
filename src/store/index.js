import gql from "graphql-tag";

export const state = () => ({
    categories: [],
    setting: null,
    docs: [],
})

export const mutations = {
    ADD_CATEGORIES(state, categories) {
        state.categories = categories;
    },
    SET_SETTING(state, setting) {
        state.setting = setting;
    },
    ADD_DOCS(state, docs) {
        state.docs = docs;
    }
}

export const actions = {
    async nuxtServerInit({ commit }, { req, app }) {
        const client = app.apolloProvider.defaultClient;
        const response = await client.query({
            query: gql`
                query {
                    allCategories {
                        id,
                        name
                    },
                    allSettings {
                        host,
                        name,
                        keywords,
                        github,
                        description,
                    },
                    allDocs {
                        name,
                        id,
                        category {
                            id
                            name
                        }
                    }
                }
            `
        })
        commit('ADD_CATEGORIES', response.data.allCategories)
        commit('SET_SETTING', response.data.allSettings[0])
        commit('ADD_DOCS', response.data.allDocs)
    }
}