import {createSlice,configureStore,createAction} from "@reduxjs/toolkit"

const mySlice = createSlice({
    name:"exhibition",
    initialState:{
        labelDetails:[

        ]
    },
    reducers:{
        addLabeltoState : (state,action)=>{
            let detail =  JSON.parse(action.payload)
            state.labelDetails = [...state.labelDetails,detail];
        },
        setLabelName : (state,action)=>{
            // state.labelDetails
            let index = action.payload.index
            state.labelDetails[index].tagName = action.payload.newName
        },
        deleteLabeltoState : (state,action)=>{
            state.labelDetails.splice(action.payload,1)
        }
    }
})


const store = configureStore({
    reducer:mySlice.reducer
})

export default store;
// export const addLabel = createAction("ADD_LABEL")
export const {addLabeltoState,setLabelName,deleteLabeltoState} = mySlice.actions;
