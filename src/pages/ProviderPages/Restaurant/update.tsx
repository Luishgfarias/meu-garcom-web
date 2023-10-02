import { Box, SimpleGrid, VStack } from '@chakra-ui/react'
import { CreateContent } from '../../../components/CreateContent'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { FormButton } from '../../../components/Form/FormButton'
import { Input } from '../../../components/Input'
import { apiProvider } from '../../../service/apiProvider'
import { ImageInput } from '../../Restaurant/Product/components/ImageInput'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppToast } from '../../../hooks/useAppToast'

export type CreateRestaurantProps = {
  name: string
  password: string
  confirmPassword: string
}

const CreateRestaurantValidationSchema = zod.object({
  name: zod.string().min(1, 'Informe o nome do restaurante'),
  password: zod
    .string()
    .min(6, 'A senha deve ter no minimo 6 digitos')
    .optional(),
  confirmPassword: zod
    .string()
    .min(6, 'A senha deve ter no minimo 6 digitos')
    .optional(),
})

export function UpdateRestaurant() {
  const navigate = useNavigate()
  const location = useLocation()
  const { handleRequestError, handleRequestSuccess } = useAppToast()
  const product = location.state
  useEffect(() => {
    console.log(product)
  }, [])
  const [productImage, setProductImage] = useState<File | undefined>(undefined)
  const { register, handleSubmit, watch, reset } =
    useForm<CreateRestaurantProps>({
      resolver: zodResolver(CreateRestaurantValidationSchema),
      defaultValues: {
        name: product.name,
      },
    })
  const observerContentForm = watch(['name', 'password', 'confirmPassword'])
  const isSubmitDisabled: boolean = !observerContentForm
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setProductImage(file)
  }
  const handleCreateRestaurant = async ({
    ...props
  }: CreateRestaurantProps) => {
    const formData = new FormData()
    Object.entries(props).forEach((entry) => {
      const [key, value] = entry
      if (key === 'confirmPassword') {
        return
      }
      return formData.append(key, String(value))
    })

    if (productImage) {
      console.log(productImage)

      formData.append('banner', productImage)
    }
    if (props.confirmPassword !== props.password) {
      return handleRequestError('Erro', 'As senhas devem ser iguais!')
    }

    try {
      await apiProvider.put('/restaurant/' + product.id, formData)
      reset()
      handleRequestSuccess('Restaurante atualizado com sucesso!')
      navigate(-1)
    } catch (error) {
      handleRequestError('')
      console.log(error)
    }
  }
  return (
    <Box w="100%">
      <CreateContent headingTitle="Criar Restaurante">
        <form onSubmit={handleSubmit(handleCreateRestaurant)}>
          <VStack spacing="8">
            <SimpleGrid minChildWidth="200px" w="100%" spacing="8">
              <SimpleGrid>
                <Input
                  name="name"
                  label="Nome do Restaurante"
                  register={register}
                />
                {/* <Input
                  name="password"
                  label="Nova Senha"
                  register={register}
                  required={false}
                />
                <Input
                  name="confirmPassword"
                  label="Confirme a senha"
                  required={false}
                  register={register}
                /> */}
              </SimpleGrid>
              <ImageInput
                name="banner"
                label="Imagem do Produto:"
                url={product.bannerUrl}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleImageChange(event)
                }
              />
            </SimpleGrid>
          </VStack>
          <FormButton isDisable={isSubmitDisabled} buttonSubmitTitle="Editar" />
        </form>
      </CreateContent>
    </Box>
  )
}
