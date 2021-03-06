<template>
  <nav v-if="$route.name != 'Embed'">
    <v-app-bar app elevation="0">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <img src="../../public/logo.png" width="120vw" />
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-text-field
        outlined
        dense
        v-if="$route.name == 'Search'"
        :placeholder="`${$t('Search')}...`"
        single-line
        append-icon="fa fa-search"
        hide-details
        @keydown.enter="search"
      />

      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn color="rgba(0,0,0,0)" small fab depressed v-on="on">
            <flag :iso="countryFlag" />
          </v-btn>
        </template>
        <v-list flat>
          <v-list-item
            v-for="(item, index) in languages"
            :key="index"
            @click="changeLanguage(item)"
          >
            <v-list-item-title class="caption"
              ><flag :iso="item.country" />

              {{ item.language.toUpperCase() }}</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            color="rgba(0,0,0,0)"
            small
            fab
            depressed
            @click="$vuetify.theme.dark = !$vuetify.theme.dark"
          >
            <v-icon small>{{
              $vuetify.theme.dark ? "fa fa-moon" : "fa fa-sun"
            }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("Dark Mode Toggle") }}</span>
      </v-tooltip>

      <v-tooltip bottom v-if="profile.role == 'Administrator'">
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            color="rgba(0,0,0,0)"
            fab
            small
            v-if="isLogged"
            depressed
            :to="{
              name: $route.name == 'upload' ? 'Search' : 'upload',
              params: { is_edit: false },
            }"
          >
            <v-icon small>{{
              $route.name == "upload" ? "fa fa-search" : "fa fa-upload"
            }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t($route.name == "upload" ? "Search" : "Upload") }}</span>
      </v-tooltip>

      <v-tooltip bottom v-if="$route.name != 'Login'">
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            color="rgba(0,0,0,0)"
            fab
            small
            v-if="isLogged"
            depressed
            @click="logout"
          >
            <v-icon small>fa fa-sign-out-alt</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("Logout") }}</span>
      </v-tooltip>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list-item>
        <v-layout column align-center>
          <v-flex mt-4 mb-3>
            <v-avatar size="100">
              <img
                :src="profile.avatar == null ? '/avatar.png' : profile.avatar"
              />
            </v-avatar>
          </v-flex>
          <v-flex>
            <p class="headline text-center">{{ profile.name }}</p>
            <p class="subtitle-1 text-center">{{ $t(profile.role) }}</p>
          </v-flex>
        </v-layout>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          color="blue darken-3"
          v-for="item in items"
          :key="item.title"
          link
          router
          :to="item.path"
          v-show="item.access === 'both' || item.access === getUser().role"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-layout column align-end v-if="$route.name == 'Search'">
      <v-layout row>
        <v-flex align-self-center>
          <span class="subtitle">{{ $t("Search By") }}</span>
        </v-flex>
        <v-flex
          v-for="selectedOption in searchOptions"
          :key="selectedOption.text"
        >
          <v-chip
            @click="searchBy(selectedOption.text)"
            :color="`${selectedOption.color} darken-3`"
            class="mx-2"
            :outlined="searchOption != selectedOption.text"
            small
            dark
          >
            {{ $t(selectedOption.text) }}
          </v-chip>
        </v-flex>
      </v-layout>
    </v-layout>
    <span v-if="searchKey != ''" class="sub-title"
      >{{ $t("Search Results for") }} {{ searchOption }} : {{ searchKey }}</span
    >
  </nav>
</template>

<script>
  import axios from "axios";
  import { mapMutations, mapGetters } from "vuex";
  export default {
    data() {
      return {
        isLogged: true,
        profile: {
          role: null,
          avatar: null,
          name: null,
        },
        submitLoading: false,
        drawer: false,
        items: [
          { title: "Search", icon: "fa fa-search", path: "/", access: "both" },
          {
            title: "TOC",
            icon: "fa fa-clipboard-list",
            path: "/toc",
            access: "both",
          },
          {
            title: "Upload",
            icon: "fa fa-upload",
            path: { name: "upload", params: { is_edit: false } },
            access: "admin",
          },
          {
            title: "Insight",
            icon: "fa fa-chart-line",
            path: "/report",
            access: "both",
          },
          {
            title: "User Management",
            icon: "fa fa-cog",
            path: "/userManagement",
            access: "admin",
          },
          {
            title: "Profile",
            icon: "fa fa-user-edit",
            path: "/profile",
            access: "user",
          },
        ],
        searchOptions: [
          { text: "All", color: "light-green" },
          { text: "Title", color: "light-blue" },
          { text: "Author", color: "lime" },
          { text: "Tag", color: "cyan" },
        ],
        searchOption: "All",
        searchKey: "",
        languages: [
          { country: "us", language: "en" },
          { country: "no", language: "no" },
        ],
      };
    },
    methods: {
      ...mapMutations(["removeToken", "setLanguage"]),
      ...mapGetters(["getToken", "getUser", "getProfile"]),
      async logout() {
        await axios.post(
          this.API_URL + "/api/user/logout",
          {},
          {
            headers: { "x-auth": this.getToken() },
          }
        );

        this.removeToken();
        this.isLogged = false;
        this.$router.push("/login");
      },
      search(e) {
        this.searchKey = e.target.value;
        this.$emit("search", {
          key: this.searchKey,
          option: this.searchOption,
        });
      },
      searchBy(text) {
        this.searchOption = text;
        this.$emit("search", {
          key: this.searchKey,
          option: this.searchOption,
        });
      },
      changeLanguage(item) {
        this.setLanguage(item.language);
        this.$i18n.locale = item.language;
      },
    },
    computed: {
      countryFlag() {
        let item = this.languages.filter(
          (item) => item.language == this.$i18n.locale
        );
        return item[0].country;
      },
    },
    mounted() {
      let profileObject = {
        name: this.getProfile().name,
        avatar: this.getProfile().avatar,
        role: this.getUser().role == "admin" ? "Administrator" : "User",
      };
      this.profile = profileObject;
    },
  };
</script>
