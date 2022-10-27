<template>
  <base-modal
    @hidden="onHidden()"
    :error="error"
    :title="modalTitle"
    id="modalNFTCreate"
  >
    <template #modal-body>
      <b-form-group label="Title">
        <b-form-input v-model="title" />
      </b-form-group>
      <b-form-group label="Description">
        <b-form-input v-model="description" />
      </b-form-group>
      <label>Properties</label>
      <b-card bg-variant="light">
        <b-form-group :key="key" v-for="(prop, key) of erc721.properties">
          <template #label>
            {{ prop.name }}
            <a href="#" v-b-tooltip :title="prop.description">
              <i class="fas fa-question-circle"></i>
            </a>
          </template>
          <template v-if="parsePropType(prop.propType) === 'image'">
            <div class="row">
              <div class="col-md-2" v-if="prop.value && prop.value.length">
                <b-spinner
                  v-if="imgLoading == key.toString()"
                  variant="primary"
                ></b-spinner>
                <img v-else :src="prop.value" width="100%" />
              </div>
              <div class="col-md-2" v-else>
                <b-spinner
                  v-if="imgLoading == key.toString()"
                  variant="primary"
                ></b-spinner>
              </div>
              <b-form-file
                @change="onDescChange"
                class="col-md-10"
                :data-key="key"
                accept="image/*"
                width="50%"
                :placeholder="
                  !isEditing || !prop.value
                    ? 'Browse to upload the image'
                    : 'Browse to change the image...'
                "
                :disabled="imgLoading == key.toString()"
              />
            </div>
          </template>
          <b-form-input
            v-else
            :type="parsePropType(prop.propType)"
            v-model="prop.value"
            required
            :placeholder="`Provide a ${prop.propType} value in this field.`"
          />
        </b-form-group>
      </b-card>
    </template>
    <template #btn-primary>
      <b-button
        :disabled="loading"
        class="rounded-pill"
        @click="submit()"
        variant="primary"
        block
      >
        {{ modalTitle }}
      </b-button>
    </template>
  </base-modal>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import type {
  TERC721,
  TERC721DefaultProp,
  TERC721Metadata,
} from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

const PROPTYPE_MAP: { [key: string]: string } = {
  string: 'text',
  number: 'number',
  image: 'image',
  link: 'url',
};

@Component({
  components: {
    BaseModal,
  },
  computed: mapGetters({}),
})
export default class ModalRewardCreate extends Vue {
  authUrl = process.env['VUE_APP_AUTH_URL'];
  docsUrl = process.env['VUE_APP_DOCS_URL'];
  loading = false;

  error = '';

  recipient = '';
  title = '';
  description = '';
  imgLoading = '';

  @Prop() pool!: IPool;
  @Prop() erc721!: TERC721;
  @Prop({ required: false }) metadata!: TERC721Metadata;

  get modalTitle() {
    return this.metadata ? 'Edit metadata' : 'Create metadata';
  }

  get isSubmitDisabled() {
    return this.loading;
  }

  get isEditing() {
    return this.metadata ? true : false;
  }

  parsePropType(propType: string) {
    return PROPTYPE_MAP[propType];
  }

  async upload(file: File) {
    const publicUrl = await this.$store.dispatch('images/upload', file);
    return publicUrl;
  }

  async onDescChange(event: any) {
    this.imgLoading = event.target.dataset.key;
    this.loading = true;
    const publicUrl = await this.upload(event.target.files[0]);
    Vue.set(
      this.erc721.properties[event.target.dataset['key']],
      'value',
      publicUrl
    );
    this.loading = false;
    this.imgLoading = '';
  }

  @Watch('metadata')
  onMetadataChange() {
    if (this.metadata) {
      this.title = this.metadata['title'];
      this.description = this.metadata['description'];
      this.erc721.properties.forEach((prop, index) => {
        this.metadata.attributes.forEach((attr) => {
          if (prop.name === attr.key) {
            this.erc721.properties[index].value = attr.value;
          }
        });
      });
    }
  }

  reset() {
    this.title = '';
    this.description = '';
    this.erc721.properties.forEach((prop) => {
      prop.value = '';
    });
  }

  onHidden() {
    this.reset();
    this.$emit('hidden');
  }

  submit() {
    const attributes: { key: string; value: string | number | undefined }[] =
      [];

    this.erc721.properties.forEach((prop: TERC721DefaultProp) => {
      if (prop.propType == 'image' && (!prop.value || !prop.value.length)) {
        return;
      }
      attributes.push({
        key: prop.name,
        value: prop.value,
      });
    });

    if (this.isEditing) {
      this.$store.dispatch('erc721/updateMetadata', {
        pool: this.pool,
        erc721: this.erc721,
        attributes,
        title: this.title,
        description: this.description,
        recipient: this.recipient.length ? this.recipient : undefined,
        id: this.metadata._id,
      });
    } else {
      this.$store.dispatch('erc721/createMetadata', {
        pool: this.pool,
        erc721: this.erc721,
        attributes,
        title: this.title,
        description: this.description,
        recipient: this.recipient.length ? this.recipient : undefined,
      });
    }

    this.$emit('success');
    this.$bvModal.hide('modalNFTCreate');
    this.reset();
  }
}
</script>
