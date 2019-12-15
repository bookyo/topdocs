<template>
   <v-row class="mx-auto" align="center" justify="center">
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="q"
            solo
            prepend-inner-icon="mdi-magnify"
            rounded
            background-color="#303030"
            color="primary"
            @change="getDoc"
            placeholder="输入关键词搜索文档"
          ></v-text-field>
        </v-card-text>
      </v-card>
      <v-card class="mt-5" v-if="results.length">
        <v-card-title>{{q}}的搜索结果</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="doc in results" :key="doc.id" :to="`/${doc.category.name}/${doc.id}`">
              <v-list-item-title>{{doc.name}}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
   </v-row>
</template>

<script>
import gql from "graphql-tag";
export default {
  data() {
    return {
      q: '',
      results: [],
    }
  },
  methods: {
    getDoc: function() {
      const q = this.q;
      const docs = this.$store.state.docs;
      const filterdocs = docs.filter(doc => doc.name.indexOf(q)>-1)
      this.results = filterdocs;
    }
  },
  head() {
    return {
      title: '搜索文档'
    }
  }
};
</script>