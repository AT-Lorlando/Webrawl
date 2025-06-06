<template>
  <Card class="max-w-md mx-auto mt-12">
    <CardHeader>
      <h2 class="text-xl font-semibold text-center">
        Créer un compte
      </h2>
    </CardHeader>
    <CardContent>
      <form
        class="space-y-6"
        @submit.prevent="onSubmit"
      >
        <!-- Champ Nom -->
        <FormField
          v-slot="{ field }"
          name="name"
          :validate-on-blur="true"
        >
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Votre nom"
                v-bind="field"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

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

        <!-- Champ Confirmation de mot de passe -->
        <FormField
          v-slot="{ field }"
          name="confirmPassword"
          :validate-on-blur="true"
        >
          <FormItem>
            <FormLabel>Confirmer le mot de passe</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Confirmez votre mot de passe"
                v-bind="field"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Bouton de soumission -->
        <Button
          type="submit"
          :disabled="isSubmitting"
          class="w-full"
        >
          S'inscrire
        </Button>

        <!-- Redirection vers la connexion -->
        <p class="text-center text-sm text-gray-500">
          Vous avez déjà un compte ?
          <RouterLink
            to="/login"
            class="text-blue-500 hover:underline"
          >
            Connectez-vous
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
import type { AxiosInstance, AxiosResponse } from 'axios';
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

interface SignupResponse {
  user: {
    id: number;
    name: string;
    email: string;
    // Ajoutez d'autres champs si nécessaire
  };
  token: {
    type: string;
    value: string;
    expiresAt?: string | null;
  };
}
// import { useAuthStore } from '~/stores/auth'

const { $axios } = useNuxtApp();
const axiosInstance = $axios as AxiosInstance;
const router = useRouter();
// const authStore = useAuthStore()

const formSchema = toTypedSchema(
  z
    .object({
      name: z
        .string()
        .min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
      email: z.string().email({ message: 'L\'email n\'est pas valide' }),
      password: z
        .string()
        .min(6, {
          message: 'Le mot de passe doit contenir au moins 6 caractères',
        }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Le mot de passe doit être confirmé.' }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Les mots de passe doivent correspondre',
      path: ['confirmPassword'],
    }),
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = {
      fullName: values.name,
      email: values.email,
      password: values.password,
    };
    const response: AxiosResponse<SignupResponse> = await axiosInstance.post(
      '/auth/signup',
      payload,
    );
    if (response.status !== 201) {
      throw new Error('Erreur lors de l\'inscription');
    }
    toast('Inscription réussie !', {
      description: 'Vous pouvez maintenant vous connecter.',
    });
    router.push('/');
  }
  catch (error: unknown) {
    console.error('Erreur lors de l\'inscription :', error);
    const errorMessage
      = error instanceof Error
        ? error.message
        : 'Une erreur est survenue.';
    toast(
      'Erreur lors de l\'inscription',
      {
        description: errorMessage,
      },
    );
  }
});
</script>
