<template>
  <v-row class="mx-auto" align="center" justify="center">
    <v-col cols="12">
      <v-parallax height="auto" dark src="/cover.png">
        <v-row align="center" justify="center">
          <v-col class="text-center py-5" cols="12">
            <v-img :src="logo" max-width="200" class="mx-auto"></v-img>
            <h1 class="font-weight-light mb-4">{{title}}</h1>
            <h4 class="subheading font-weight-thin">{{subtitle}}</h4>
            <v-btn class="mt-6" color="primary" x-large :to="buttonurl">{{buttontitle}}</v-btn>
          </v-col>
        </v-row>
      </v-parallax>
      <v-card class="mt-10" v-if="md.trim().length">
        <v-card-text v-html="$md.render(md)"></v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import gql from "graphql-tag";
export default {
  async asyncData({ app, params, req, res, store }) {
    const client = app.apolloProvider.defaultClient;
    const response = await client.query({
      query: gql`
        query {
          allSettings {
            index
          }
        }
      `
    });
    const indexmd = response.data.allSettings[0].index;
    const mdarr = indexmd.split("===header===");
    const title = mdarr[0].match(/-title-(.*)-title-/)[1];
    const subtitle = mdarr[0].match(/-subtitle-(.*)-subtitle-/)[1];
    const logo = mdarr[0].match(/-logo-(.*)-logo-/)[1];
    const buttonstring = mdarr[0].match(/-button-(.*)-button-/)[1];
    const buttonarr = buttonstring.split("$");
    const buttontitle = buttonarr[0];
    const buttonurl = buttonarr[1];
    return {
      title,
      subtitle,
      md: mdarr[1],
      logo,
      buttontitle,
      buttonurl
    };
  },
  data() {
    return {
      drawer: false
    };
  },
  head() {
    return {
      title: this.$store.state.setting
        ? this.$store.state.setting.seotitle
        : "跨世代文档编辑系统",
      meta: [
        { name: "keywords", content: this.$store.state.setting.keywords },
        { name: "description", content: this.$store.state.setting.description }
      ]
    };
  }
};
</script>

<style>
</style>