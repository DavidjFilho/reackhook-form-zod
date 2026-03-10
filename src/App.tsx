import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createUserFormSchema = z.object({
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .transform((name) => {
      return name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1));
        })
        .join(" ");
    }),

  email: z
    .string()
    .nonempty("O e-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .toLowerCase()
    .refine((email) => {
      return email.endsWith("@rocketseat.com.br");
    }, "O e-mail precisa ser da Rocketseat"),

  password: z.string().min(6, "A senha precisa de no mínimo 6 caracteres"),

  techs: z
    .array(
      z.object({
        title: z.string().nonempty("O título é obrigatório"),

        knowledge: z
          .string()
          .nonempty("O nível de conhecimento é obrigatório")
          .transform((value) => Number(value))
          .refine((value) => !Number.isNaN(value), {
            message: "O nível de conhecimento deve ser um número",
          })
          .refine((value) => value >= 1, {
            message: "O nível mínimo é 1",
          })
          .refine((value) => value <= 100, {
            message: "O nível máximo é 100",
          }),
      }),
    )
    .min(2, "Insira pelo menos 2 tecnologias"),
});

//type CreateUserFormData = z.infer<typeof createUserFormSchema>;
type CreateUserFormInput = z.input<typeof createUserFormSchema>;
type CreateUserFormData = z.output<typeof createUserFormSchema>;

export function App() {
  const [output, setOutput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormInput, any, CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      techs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  function addNewTech() {
    append({ title: "", knowledge: "" });
  }

  function createUser(data: any) {
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col gap-10 items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            type="text"
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-sm text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label>Tecnologias</label>
            <button
              type="button"
              onClick={addNewTech}
              className="text-emerald-500 text-sm font-medium"
            >
              Adicionar
            </button>
          </div>

          {fields.map((field, index) => {
            return (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Tecnologia"
                    className="border border-zinc-200 shadow-sm rounded h-10 px-3"
                    {...register(`techs.${index}.title`)}
                  />

                  {errors.techs?.[index]?.title && (
                    <span className="text-sm text-red-500">
                      {errors.techs[index]?.title?.message}
                    </span>
                  )}
                </div>

                <div className="w-24 flex flex-col gap-1">
                  <input
                    type="number"
                    placeholder="0-100"
                    className="w-22 border border-zinc-200 shadow-sm rounded h-10 px-3"
                    {...register(`techs.${index}.knowledge`)}
                  />

                  {errors.techs?.[index]?.knowledge && (
                    <span className="text-sm text-red-500">
                      {errors.techs[index]?.knowledge?.message}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="h-10 px-2 text-sm text-red-500"
                >
                  Remover
                </button>
              </div>
            );
          })}
          {errors.techs && (
            <span className="text-red-500 text-sm">{errors.techs.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600"
        >
          Salvar
        </button>
      </form>
    </main>
  );
}
