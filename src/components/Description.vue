<template>
  <div class="styled-description" :class="{compact, inline}" v-html="markup(description)" />
</template>

<script>
import markdownit from 'markdown-it';

export default {
  name: 'Description',
  props: {
    description: {
      type: String,
      default: ''
    },
    compact: {
      type: Boolean,
      default: false
    },
    inline: {
      type: Boolean,
      default: false
    },
    allowHTML: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    markup(text) {
      if (typeof text !== 'string') {
        return '';
      }

      // Render Markdown
      const md = markdownit({
        html: this.allowHTML,
        linkify: true,
        typographer: true
      });
      return md.render(text);
    }
  }
};
</script>

<style lang="scss">
@import '../theme/variables.scss';

#stac-browser .styled-description {
  line-height: 1.4em;

  h1, h2, h3, h4, h5, h6 {
    color: map-get($theme-colors, "primary");
    font-weight: 600;
    font-family: $font-family-sans-serif;
  }
  h1 {
    font-size: 1.15rem;
  }
  h2 {
    font-size: 1.1rem;
  }
  h3 {
    font-size: 1.0rem;
  }
  h4 {
    font-size: 1rem;
  }
  h5 {
    font-size: 0.9rem;
  }
  h6 {
    font-size: 0.9rem;
  }
  pre {
    background-color: #eee;
    width: 100%;
    border: 1px solid #ccc;
    max-height: 15em;
    overflow-y: auto;
  }
  pre code {
    background-color: transparent;
    display: block;
    margin: 0.5em;
  }
  code {
    color: maroon;
    display: inline-block;
    padding: 0 0.1em;
  }
  img {
    max-width: 100%;
    max-height: 100%;
  }

  &.compact {
    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
      font-size: 1.1em;
      margin: 0.5em 0;
    }
    p {
      margin: 0.5em 0;
      font-size:13px;
    }
    p:first-child {
      margin-top: 0;
    }
    p:last-child {
      margin-bottom: 0;
    }
    pre {
      max-height: 7em;
      width: auto;
      max-width: 100%;
    }
  }

  &.inline {
    display: inline;
    p, pre, code, h1, h2, h3, h4, h5, h6 {
      display: inline;
    }
  }
}
</style>
