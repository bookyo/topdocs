<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list shaped dense>
        <v-list-group
          color="primary"
          no-action
          v-for="item in $store.state.categories"
          :key="item.id"
          :value="$route.path.indexOf(item.name)>-1?true:false"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title v-text="item.name"></v-list-item-title>
            </v-list-item-content>
          </template>
          <template v-for="doc in $store.state.docs">
            <v-list-item
              link
              nuxt
              :to="`/${item.name}/${doc.id}`"
              v-if="doc.category.id == item.id"
              :key="doc.id"
            >
              <v-list-item-content>
                <v-list-item-title>{{doc.name}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-items>
        <v-btn text to="/">{{$store.state.setting.name}}</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-btn icon :href="$store.state.setting.github">
        <v-icon>{{mdiGithubCircle}}</v-icon>
      </v-btn>
      <v-btn icon @click="gosearch">
        <v-icon>{{mdiMagnify}}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>

    <v-footer app>
      <span>&copy; {{new Date().getFullYear() + ' ' + $store.state.setting.name}}</span>
    </v-footer>
  </v-app>
</template>
<style>
.v-application {
  font-family: Roboto, "Noto Sans CJK SC", "Noto Sans SC", "Microsoft Yahei",
    Arial, Helvetica, sans-serif;
}
</style>
<script>
import { mdiGithubCircle,mdiMagnify } from '@mdi/js'
export default {
  data() {
    return {
      drawer: this.$route.path == "/" ? false : null,
      mdiGithubCircle,
      mdiMagnify
    };
  },
  methods: {
    gosearch: function() {
      this.$router.push('/search');
    }
  },
  watch: {
    //监听路由变化
    $route(to, from) {
      if(to.path=="/") {
        this.drawer = false;
      } else {
        if(this.$vuetify.breakpoint.width>1264) {
          this.drawer = true;
        }
      }
    }
  },
  created() {
    this.$vuetify.theme.dark = true;
  }
};
</script>