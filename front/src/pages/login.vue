<template>
  <Card class="max-w-md mx-auto mt-12">
    <CardHeader>
      <h2 class="text-xl font-semibold text-center">
        Connexion
      </h2>
    </CardHeader>
    <CardContent>
      <form
        class="space-y-6"
        @submit.prevent="onSubmit"
      >
        <!-- Champ Email -->
        <FormField
          v-slot="{ field }"
          name="email"
          :validate-on-blur="true"
        >
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="you@example.com"
                v-bind="field"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Champ Mot de passe -->
        <FormField
          v-slot="{ field }"
          name="password"
          :validate-on-blur="true"
        >
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Votre mot de passe"
                v-bind="field"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Message d'erreur -->
        <p
          v-if="errorMessage"
          class="text-red-500 text-sm text-center"
        >
          {{ errorMessage }}
        </p>

        <!-- Bouton de soumission -->
        <Button
          type="submit"
          :disabled="isSubmitting"
          class="w-full"
        >
          Se connecter
        </Button>

        <!-- Redirection vers l'inscription -->
        <p class="text-center text-sm text-gray-500">
          Vous n'avez pas de compte ?
          <RouterLink
            to="/signup"
            class="text-blue-500 hover:underline"
          >
            Inscrivez-vous
          </RouterLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { useRouter, RouterLink } from 'vue-router';
import { ref } from 'vue';
import { type AxiosInstance, type AxiosResponse, AxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '~/stores/auth';

interface LoginResponse {
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  token: {
    type: string;
    token: string;
    expiresAt?: string | null;
  };
}

const $axios = useNuxtApp().$axios as AxiosInstance;

const router = useRouter();
const authStore = useAuthStore();

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email({ message: 'L\'email n\'est pas valide' }),
    password: z.string(),
  }),
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const errorMessage = ref<string | null>(null);

const onSubmit = handleSubmit(async (values) => {
  try {
    errorMessage.value = null;
    const payload = {
      email: values.email,
      password: values.password,
    };
    const response: AxiosResponse<LoginResponse> = await $axios.post(
      '/auth/login',
      payload,
    );
    console.log(response.data);
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    // Save token and user data in the auth store
    authStore.login(
      response.data.user,
      response.data.token.token,
    );

    toast('Connexion réussie !', {
      description: 'Bienvenue sur votre tableau de bord.',
    });
    router.push('/');
  }
  catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.data?.errors) {
        errorMessage.value = error.response.data.errors
          .map((err: { message: string }) => err.message)
          .join(', ');
      }
      else {
        errorMessage.value = error.response?.data?.message || 'Erreur inconnue';
      }
    }

    if (!errorMessage.value) {
      errorMessage.value = 'Erreur inconnue';
    }
    toast(
      'Erreur lors de la connexion',
      {
        description: errorMessage.value || 'Erreur inconnue',
      },
    );
  }
});
</script>
