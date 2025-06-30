<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center space-x-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Icon name="lucide:music" class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-3xl font-bold text-white">Webrawl Music</h1>
        </div>
        <p class="text-slate-300">Connectez-vous à votre compte</p>
      </div>

      <!-- Login Form -->
      <Card class="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader>
          <h2 class="text-2xl font-semibold text-center text-white">
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
                <FormLabel class="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    v-bind="field"
                    class="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
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
                <FormLabel class="text-white">Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Votre mot de passe"
                    v-bind="field"
                    class="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Message d'erreur -->
            <div v-if="errorMessage" class="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p class="text-red-300 text-sm text-center">
                {{ errorMessage }}
              </p>
            </div>

            <!-- Bouton de soumission -->
            <Button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
              size="lg"
            >
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              <Icon v-else name="lucide:log-in" class="w-4 h-4 mr-2" />
              {{ isSubmitting ? 'Connexion...' : 'Se connecter' }}
            </Button>

            <!-- Redirection vers l'inscription -->
            <div class="text-center">
              <p class="text-slate-300 text-sm">
                Vous n'avez pas de compte ?
                <RouterLink
                  to="/signup"
                  class="text-cyan-300 hover:text-cyan-200 hover:underline font-medium"
                >
                  Inscrivez-vous
                </RouterLink>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Back to Home -->
      <div class="text-center mt-8">
        <Button variant="ghost" class="text-slate-400 hover:text-white" @click="navigateTo('/')">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>

      <!-- Quick Start -->
      <div class="mt-12">
        <Card class="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent class="p-4">
            <div class="text-center">
              <h3 class="text-white font-medium mb-2">Envie de tester rapidement ?</h3>
              <p class="text-slate-400 text-sm mb-4">
                Créez une partie sans compte et partagez le code avec vos amis
              </p>
              <Button
                variant="outline"
                class="border-cyan-400 text-cyan-300 hover:bg-cyan-400/20"
                @click="navigateTo('/game')"
              >
                <Icon name="lucide:gamepad-2" class="w-4 h-4 mr-2" />
                Jouer sans compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
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

    toast.success('Connexion réussie !', {
      description: 'Bienvenue sur votre tableau de bord.',
    });
    
    await navigateTo('/');
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
    
    toast.error('Erreur lors de la connexion', {
      description: errorMessage.value || 'Erreur inconnue',
    });
  }
});
</script>
