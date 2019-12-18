<template>
  <v-row class="mx-auto" align="center" justify="center">
    <v-col cols="12">
      <v-card>
        <v-breadcrumbs :items="items"></v-breadcrumbs>
      </v-card>
      <v-card class="mt-5">
        <v-card-title>{{doc.name}}</v-card-title>
        <v-card-subtitle v-text="$moment(doc.createdAt).fromNow()"></v-card-subtitle>
        <v-card-text v-html="$md.render(doc.md)"></v-card-text>
        <v-card-actions>
          <v-btn class="docs-action" v-if="pre" link :to="`/${pre.category.name}/${pre.id}`">{{pre.name}}</v-btn>
          <v-spacer></v-spacer>
          <v-btn class="docs-action" v-if="next" link :to="`/${next.category.name}/${next.id}`">{{next.name}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
<style>
.docs-action {
  overflow: hidden;
  max-width: 49%;
}
.docs-action .v-btn__content {
  align-self: center;
  max-width: 100%;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<script>
import gql from "graphql-tag";
export default {
  async asyncData({ app, params, req, res, store }) {
    const client = app.apolloProvider.defaultClient;
    const name = params.name;
    const id = params.id;
    const docs = store.state.docs;
    const categorydocs = docs.filter(doc => doc.category.name == name);
    const length = categorydocs.length;
    const index = categorydocs.findIndex(doc => doc.id == id);
    let pre = 0;
    let next = 0;
    if (length > 0) {
      if (index == 0 && index + 1 != length) {
        next = categorydocs[index + 1];
      }
      if (index > 0 && index + 1 < length) {
        pre = categorydocs[index - 1];
        next = categorydocs[index + 1];
      }
      if (index > 0 && index + 1 == length) {
        pre = categorydocs[index - 1];
      }
    }
    try {
      const response = await client.query({
        query: gql`
          query getDoc($id: ID!) {
            Doc(where: { id: $id }) {
              id
              name
              md
              createdAt
            }
          }
        `,
        variables: {
          id: id
        }
      });
      const doc = response.data.Doc;
      if (!doc) {
        return error({ message: "对不起,页面未找到!", statusCode: 404 });
      }
      return {
        doc: doc,
        pre,
        next,
        items: [
          {
            text: "首页",
            disabled: false,
            to: "/"
          },
          {
            text: doc.name,
            disabled: true,
            to: "/" + name + "/" + id
          }
        ]
      };
    } catch (error) {
      console.log(error.message);
    }
  },
  head() {
    return {
      title: this.doc.name + " - " + this.$store.state.setting.name
    };
  },
  validate({ params }) {
    // 必须是objectid
    return /^[a-f0-9]{24}$/.test(params.id);
  },
};
</script>