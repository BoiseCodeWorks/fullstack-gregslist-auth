<template>
  <div class="car-details container">
    <div class="row pt-5">
      <div class="col-md-6">
        <img class="w-100" :src="state.car.imgUrl" alt="">
      </div>
      <div class="col-md-6 d-flex flex-column justify-content-between">
        <div>
          <h2>{{ state.car.make }} - {{ state.car.model }}</h2>
          <h2>{{ state.car.year }} -  ${{ state.car.price }}</h2>
          <p>{{ state.car.description }}</p>
        </div>
        <div class="d-flex justify-content-between">
          <i class="fas fa-trash" @click="deleteCar" v-if="state.user.isAuthenticated && state.account.id === state.car.creatorId"></i>
          <button type="button" class="btn btn-outline-success" @click="bid" :disabled="!state.user.isAuthenticated" :title="state.user.isAuthenticated ? 'bid': 'You must login to bid!'">
            Bid (+100)
          </button>
        </div>
      </div>
    </div>
    <div class="row">
      <form @submit.prevent="addComment" class="col-12 pt-5" v-if="state.user.isAuthenticated">
        <div class="form-group">
          <label for="comment">Add Comment</label>
          <div class="d-flex">
            <input type="text"
                   class="form-control col-md-4"
                   name="comment"
                   id="comment"
                   aria-describedby="helpId"
                   placeholder="Comment..."
                   v-model="state.newComment.body"
            >
            <button type="submit" class="btn btn-link">
              <i class="fas fa-plus    "></i>
            </button>
          </div>
        </div>
      </form>
      <div class="col-12 mb-5">
        <div v-for="comment in state.car.comments" :key="comment.id">
          <div class="bg-white p-3 my-4 shadow">
            <div class="d-flex align-items-center p-2 border-bottom justify-content-between">
              <div class="d-flex align-items-center">
                <img class="w-1 rounded-circle" :src="comment.creator.picture" :alt="comment.creator.name + ' picture'">
                <p class="m-0 ml-3">
                  {{ comment.creator.name }}
                </p>
              </div>
              <i class="fas fa-trash" @click="deleteComment(comment.id)" v-if="state.user.isAuthenticated && state.account.id === comment.creatorId"></i>
            </div>
            <div class="ml-5 my-3">
              <p class="m-0">
                {{ comment.body }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { AppState } from '../AppState'
import { reactive, computed, onMounted } from 'vue'
import { carsService } from '../services/CarsService'
import Notification from '../utils/Notification'
import { socketService } from '../services/SocketService'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const state = reactive({
      newComment: { carId: route.params.id },
      car: computed(() => AppState.activeCar),
      user: computed(() => AppState.user),
      account: computed(() => AppState.account)
    })
    onMounted(() => {
      carsService.getCarById(route.params.id)
      socketService.emit('JOIN_ROOM', { roomId: route.params.id })
    })
    onBeforeRouteLeave((to, from, next) => {
      socketService.emit('LEAVE_ROOM', { roomId: route.params.id })
      next()
    })
    return {
      state,
      async bid() {
        try {
          state.car.price += 100
          await carsService.bid(state.car)
          Notification.toast('Bid Submitted', 'success')
        } catch (error) {
          Notification.toast(error, 'error')
        }
      },
      async deleteCar() {
        try {
          await carsService.deleteCar(state.car.id)
          AppState.activeCar = null
          router.push({ name: 'Cars' })
        } catch (error) {
          Notification.toast(error, 'error')
        }
      },
      async addComment() {
        try {
          await carsService.addComment(state.newComment)
          state.newComment = { carId: route.params.id }
          Notification.toast('Commented', 'success')
        } catch (error) {
          Notification.toast(error, 'error')
        }
      },
      async deleteComment(commentId) {
        try {
          await carsService.deleteComment(state.car.id, commentId)
          Notification.toast('deleted', 'success')
        } catch (error) {
          Notification.toast(error, 'error')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
 .fa-trash {
   cursor: pointer;
   &:hover {
     color: red;
    transform: translateY(-1px);
    text-shadow: 1px 1px 15px rgb(204, 204, 204);
  }
 }

 .w-1 {
   width: 2.5em
 }
</style>
